---
layout: post
title: Smooth transitions with refs in React.js
categories: client
tags: React javascript
js:
- using-refs-in-react
---

## Challenge

* I want a reusable React component which works like an expandable menu button following the
[Google material design guidelines](https://material.google.com/motion/material-motion.html#material-motion-what-makes-a-good-transition)
* this component should be flexible enough to allow arbitrary content
to de displayed inside the button and menu area.
* container size is not known beforehand, as the length of the
button text and menu context may vary, so straightforward approach
using CSS animations does not work.
* [react-css-transition-replace](https://github.com/marnusw/react-css-transition-replace)
cannot be used, as it does not handle container width changes.

## Example

<a target="_blank" href="https://github.com/bkon/bkon.github.io/blob/master/src/jsx/using-refs-in-react.tsx" class="external">Full source</a> (opens in a new window)
<div id="react-component"></div>

## Solution

In order to use CSS transitions, we need to have fixed values for
container width and height in both states: opened and closed.  "Pure"
React is not helpful in this case, as it knows nothing about the
element sizes, but one thing we can do is to get a reference to the
DOM node after an element has been mounted and access its `clientWidth`
and `clientHeight` properties.

Let's assume we got these references saved to `_button` and `_menu`
instance attributes of out components. In this case, getting these CSS
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

Note the extra condition at lines 4-6. We're going to use these styles
in the `render` method, and this means that it may be called when the
component is not mounted yet, so refs won't be available.

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
{% endhighlight %}

*If you're confused by `R.always(...)` above, is a declarative shorthand
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

      return (
        <div className={ isOpen && styles.containerOpen || styles.container }
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
here. It is not a requirement, normal strings as CSS classe names
would do, but I do want my CS classes to be unique to reduce blog
maintenance in future*

Looks simple, but... doesn't work yet. If we add some debug logging to
the `render`  method and `ref` helper,  we would see that  `render` is
called  first, and  only after  that we  get two  calls to  `ref`. The
obvious reason is  React requires the component to be  rendered to the
virtual dom before it is mounted to the actual document.

If only we could force the update after the component is mounted...

{% highlight javascript linenos %}
componentDidMount(): void {
  this.forceUpdate();
}
{% endhighlight %}

... and yes we can.

Now the only remaining part is to
[add some nice styling and actual CSS transitions](https://github.com/bkon/bkon.github.io/blob/master/src/scss/expandable-dropdown.scss)
to the component.

Have fun!
