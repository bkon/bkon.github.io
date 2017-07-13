---
layout: post
title: Detecting typos in redux action names - the easy way
categories: client
tags: React Redux javascript
excerpt:
  |
    <p>Preventing one of the most annoying problems with Redux &mdash;
    typos in action names causing your reducer branch to be ignored.</p>
---

## Challenge

[Using Proxies with Redux Types](https://reactjsnews.com/proxies-with-redux-types) describes
a smart way of using ES2015 language feature to prevent us from
accidentally importing a non-existent action name and attempting to
use it in your Redux reducer.

I'd like to look at the problem from another side, asking myself two questions:

- Is there a valid case when application needs to access a
  non-existent export in the production environment?
- Can we competely prevent this from happening even before application is run?

## Example

### `types.js`

{% highlight javascript linenos %}
const types = {
  FETCH_FILE_REQUEST: 'fetch_file_request',
  FETCH_FILE_SUCCESS: 'fetch_file_success',
  FETCH_FILE_FAIL: 'fetch_file_fail'
}

export default types;
{% endhighlight %}

### `consumer.js`

{% highlight javascript linenos %}
import {
  FETCH_FILE_REQUEST,
  FETCH_FILE_SUCESS,
  FETCH_FILE_FAIL
} from './types';

const filesReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_FILE_SUCESS:
      return { ...state, file: action.payload };
    default:
      return state;
  }
}
{% endhighlight %}

## Solution

In general, JS made a giant step towards allowing static source
analysis recently, Typescript and flow annotations being a good
example of this. When I face the problem similar to one described
above, it feels like a job for those tools - solution which deals with
errors on application level works, but it produces a runtime
error. Let's make our build fail instead.

Now, I presume you already using `eslint`. You really should be.  One
of the awesome features of it is it has may plugins which would
analyze the code for you. And guess what? There's one which does
exactly what we need (and much more), saving a lot of headache
debugging mysterious application problems:
[eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)

Let's start with adding this tool:

```
yarn add eslint eslint-plugin-import
```

... and configuring it by putting the following to .eslintrc:

```
extends:
  - eslint:recommended
  - plugin:import/errors
  - plugin:import/warnings

parserOptions:
  sourceType: module
  ecmaVersion: 6
  ecmaFeatures:
    experimentalObjectRestSpread: true
```

Now, let's see what it does:

```
> ./node_modules/.bin/eslint consumer.js

./consumer.js
  3:3  error  FETCH_FILE_SUCESS not found in './types'           import/named
  4:3  error  'FETCH_FILE_FAIL' is defined but never used        no-unused-vars
  7:7  error  'filesReducer' is assigned a value but never used  no-unused-vars
```

... and that's exactly what we wanted. Add `eslint` to your testing
pipeline, enable IDE integrations and you'll be seeing these bugs
immediately as they appear.
