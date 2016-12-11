---
layout: post
title: Smooth transitions with refs in React.js
categories: client
tags: React javascript
excerpt:
  |
    <p>Let's use React refs to build an animated dropdown
    button component which follows Google material design guidelines.</p>
js:
- using-refs-in-react
---

## Challenge

* I want a reusable React component which works like an expandable menu button following the
[Google material design guidelines](https://material.google.com/motion/material-motion.html#material-motion-what-makes-a-good-transition)
* This component should be flexible enough to allow arbitrary content
to be displayed inside the button and menu area.
* The container size is not known beforehand, as the length of the
button text and the height of the menu content may vary, so
straightforward approach using CSS animations does not work.
* [react-css-transition-replace](https://github.com/marnusw/react-css-transition-replace)
cannot be used, as it does not handle container width changes.

## Example

<a target="_blank" href="https://github.com/bkon/bkon.github.io/blob/source/src/jsx/using-refs-in-react.tsx" class="external">Full source</a> (opens in a new window)
<div id="react-component"></div>

## Solution

In order to use CSS transitions, we need to have fixed values for
container width and height in both opened and closed states. Pure
React is not helpful in this case, as it knows nothing about the
element sizes, but one thing we can do is to get a reference to the
DOM node after an element has been mounted and access its `clientWidth`
and `clientHeight` properties.

Let's assume we got these references saved to `_button` and `_menu`
instance attributes of our component. In this case, getting these CSS
values is as simple as having this method in your component
definition:

{% highlight javascript linenos %}
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
}
{% endhighlight %}

*Note the extra condition at lines 6-8. We're going to use these styles
inside the `render` method and this means that this code may be
executed when the component is not mounted yet, so refs won't be
available.*

Next step: let's use HOC to satisfy the "can render arbitrary content"
requirement.

{% highlight javascript linenos %}
const Dropdown: ComponentClass<Openable> =
  genericDropdown<{}>(Button, Menu);
{% endhighlight %}

We're passing two components which will be used to render the
clickable area and the dropdown menu. These two components are
fully isolated from each other.

{% highlight javascript linenos %}
const Button: React.StatelessComponent<{}> = R.always(
  <div className={ styles.button }>Click me!</div>
);

const Menu: React.StatelessComponent<{}> = R.always(
  <div className={ styles.menu }>
    <div className={ styles.menuItem }>Eat the mysterious pie</div>
    <div className={ styles.menuItem }>Cry</div>
    <div className={ styles.menuItem }>Drink the mysterious potion</div>
    <div className={ styles.menuItem }>Go adventuring</div>
  </div>
);
{% endhighlight %}

*If you're confused by `R.always(...)` above, it is a declarative shorthand
for `() => ...` provided by the [Ramda](http://ramdajs.com/) toolbelt
library.*

Now to the actual implementation of the HOC:

{% highlight javascript linenos %}
function genericDropdown<Props>(
  Button: E<Props>,
  Menu: E<Props>
): ComponentClass<Props & Openable> {
  return createClass<(Props & Openable), DropdownState>({
    displayName: "ExpandableDropdown",

    containerStyle(): ...

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
{% endhighlight %}

*I've used [css-modules](https://github.com/css-modules/css-modules)
here. It is not a requirement; normal CSS class names would work, but
I do want my CS classes to be unique to reduce blog maintenance in
future.*

It looks simple, but... doesn't work yet. If we check DOM contents in
developer tools, we'd see that styles on the container `div` are not
being set.

Time to add some logging to the `render` method and `ref`
helper. After re-running the example the console shows that `render`
is called before `ref`, leaving us with no DOM references. The obvious
cause is React requires the component to be rendered to the virtual
dom before it is mounted to the actual document, and there were no
changes in `props` or `state` which would cause React to re-render our
component after that.

If only we could force the update *after* the component is mounted&hellip;

{% highlight javascript linenos %}
componentDidMount(): void {
  this.forceUpdate();
}
{% endhighlight %}

&hellip;which is in fact quite easy to do.

Now the only remaining part is to
[add some nice styling and actual CSS transitions](https://github.com/bkon/bkon.github.io/blob/source/src/scss/expandable-dropdown.scss)
to the component.

Have fun!
