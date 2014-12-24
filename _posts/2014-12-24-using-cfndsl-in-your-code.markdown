---
layout: default
title: Generate CloudFormation JSON with cfndsl from your code
categories: development
tags: aws devops ruby cloudformation
---

As shown
[here](https://coderwall.com/p/sxtlzw/create-an-aws-stack-with-cfndsl),
it's not that hard to generate a JSON template from cfndsl
file. But... we're changing a value of ```$stdout``` global and using
```instance_eval```, both of which look rather dirty for me.  Can we
make it more friendly to the developers and tester's eye?

And the answer is, obviously, "yes, we can!"

{% highlight ruby %}
json = CfnDsl::eval_file_with_extras(filename).to_json
{% endhighlight %}

Too simple? Ok, if you want a bit more complicated code:

{% highlight ruby %}
json = CfnDsl::eval_file_with_extras filename, [[:ruby, "vars.rb"]], STDERR
{% endhighlight %}

What about those two mysterious parameters ```[[:ruby, "vars.rb"]]```
and ```STDERR```?

The first one is the [list of "extras" files](https://github.com/stevenjack/cfndsl/blob/988b03f37ca85361d881ec75ab28e55dd2d88dc9/lib/cfndsl.rb) which allows you to
set up template variables.

The  second one  is a  simple ```IO```  object which  will be  used to
generate a  verbose log of cfndsl  actions.  If not given,  logging is
disabled.

Now, that tells us how to generate the JSON contents using an external
file.  What if you just want to embed the template to your source code
directly for whatever reason?  Fear not - it makes things even easier!

{% highlight ruby %}
CloudFormation do
  ... your stack contents ...
end.to_json
{% endhighlight %}

Good luck with your stacks!
