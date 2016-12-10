import * as R from "ramda";
import * as React from "react";
import {
  createClass,
  ClassicComponentClass,
  ComponentClass,
  StatelessComponent,
  ReactElement,
  Ref,
  CSSProperties,
  ReactType
} from "react";
import * as ReactDOM from "react-dom";
import { compose, withState, withProps } from "recompose";
import * as enhanceWithClickOutside from "react-onclickoutside";

const styles: any = require("../scss/expandable-dropdown.scss");

type E<Props> = ComponentClass<Props> | StatelessComponent<Props> | string;

interface OpenableState {
  isOpen: boolean,
  setOpen: (value: boolean) => void
}

interface Openable {
  isOpen: boolean,
  toggle: () => void,
  close: () => void,
  open: () => void
}

interface DropdownRefs {
  [key: string]: any
}

const Button: React.StatelessComponent<{}> = R.always(
  <div className={ styles.button }>Click Me!</div>
);

const Menu: React.StatelessComponent<{}> = R.always(
  <div className={ styles.menu }>
    <div className={ styles.menuItem }>Eat the mysterious pie</div>
    <div className={ styles.menuItem }>Cry</div>
    <div className={ styles.menuItem }>Drink the mysterious potion</div>
    <div className={ styles.menuItem }>Go adventuring</div>
  </div>
);

function ref(el: ReactElement<any> & DropdownRefs, prop: string): Ref<any> {
  return function(instance: any): void {
    el[prop] = instance;
  }
}

function genericDropdown<Props>(
  Button: E<Props>,
  Menu: E<Props>
): ComponentClass<Props & Openable> {
  return createClass<(Props & Openable), {}>({
    displayName: "ExpandableDropdown",

    componentDidMount(): void {
      this.forceUpdate();
    },

    containerStyle(): CSSProperties {
      const { isOpen } = this.props;
      const button = this._button;
      const menu = this._menu;

      if (!button || !menu) {
        return {};
      }

      if (!isOpen) {
        return {
          height: button.clientHeight,
          width: button.clientWidth
        };
      }

      return {
        height: menu.clientHeight + button.clientHeight,
        width: R.max(menu.clientWidth, button.clientWidth)
      };
    },

    render(): ReactElement<Props> {
      const { isOpen, toggle } = this.props;

      const containerClass =
          isOpen ?
          styles.containerOpen :
          styles.container;

      return (
        <div className={ containerClass }
             style={ this.containerStyle() }
             onClick={ toggle }>
          <div>
            <div className={ styles.buttonContainer }
                 ref={ ref(this, "_button") }>
              <Button { ...this.props } />
            </div>
          </div>
          <div>
            <div className={ styles.menuContainer }
                 ref={ ref(this, "_menu") } >
              <Menu { ...this.props } />
            </div>
          </div>
        </div>
      );
    }
  })
}

const Dropdown: ComponentClass<Openable> =
  genericDropdown<{}>(Button, Menu);

const UnmanagedDropdown: ComponentClass<{}> = compose<Openable, {}>(
  withState<OpenableState>("isOpen", "setOpen", false),
  withProps<Openable, OpenableState>(
    ({ isOpen, setOpen }) => ({
      isOpen,
      toggle: () => setOpen(!isOpen),
      open: () => setOpen(true),
      close: () => setOpen(false)
    })
  ),
  withProps(
    ({ close }) => ({
      handleClickOutside: close
    })
  ),
  enhanceWithClickOutside
)(Dropdown);

ReactDOM.render(
  <div className={ styles.positionContainer }>
    <div className={ styles.positionWrapper }>
      <UnmanagedDropdown />
    </div>
  </div>,
  document.querySelector("#react-component")
)
