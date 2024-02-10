# htmx-call
HTMX Extension to support swapping from a global defined function

This is just an initial implementation, with only the most basic functionality, it adds the `hx-call` attribute which allow you to select a function.

This library was designed to make it easy to interface with functions bound to the window using [webview](https://github.com/webview/webview)

Though really it can used to call any globally defined function, that has one of several signatures

* `function(args): Promise<string>`
* `function(args): Promise<Object>`
* `function(args): string`
* `function(args): Object`

The `args` will be the merged values of the `hx-vals` and any input/form data

The returned object should follow this shape

```
{
    "hx-reswap":  "string",
    "hx-retarget": "string",
    "hx-trigger": "string",
    "hx-trigger-after-swap": "string",
    "hx-trigger-after-settle": "string",
    "hx-reselect": "string",
    "content": "string" // the content to swap in
}
```

To use in webview, first bind your function

```go
w := webview.New(false)
w.Bind('hello-world', func () struct {
    Content string `json:"content"`
  } {
  return struct {
    Content string `json:"content"`
  }{
    `<h1>Hello World</h1>`,
  }
})
```

Add `hx-call` attribute with the name of bound function

```html
<body hx-ext="call">
  ...
  <div id="target"></div>
  <button hx-call="hello-world" hx-target="#target">Click Me</button>
  ...
</body>

```

Accepts `hx-vals` as an arguments

```html
<body hx-ext="call">
  ...
  <div id="target"></div>
  <button id="world" hx-call="hello-world" hx-target="#target" hx-vals="js:{ name: event.target.id }">Click Me</button>
  ...
</body>

```

Values are passed to bound function as a map

```go
w := webview.New(false)
w.Bind('hello-world', func (args map[string]string) {
    Content string `json:"content"`
  } {
  return struct {
    Content string `json:"content"`
  }{
    fmt.Sprintf(`<h1>Hello %s</h1>`, args["name"]),
  }
})
```

Use `hx-call-content` attribute to select a field to swap in

```go
w := webview.New(false)
w.Bind('hello-world', func (args map[string]string) {
    SomeField string `json:"somefield"`
  } {
  return struct {
    SomeField string `json:"somefield"`
  }{
    fmt.Sprintf(`<h1>Hello %s</h1>`, args["name"]),
  }
})
```

```html
<body hx-ext="call">
  ...
  <div id="target"></div>
  <button id="world" hx-call="hello-world" hx-target="#target" hx-call-content="somefield" hx-vals='js:{ name: event.target.id }'>Click Me</button>
  ...
</body>

```

You can change the target element by adding the `hx-retarget` field to the return value

```go
w := webview.New(false)
w.Bind('hello-world', func () struct {
    HXRetarget string `json:"hx-retarget"`
    Content    string `json:"content"`
  } {
  return struct {
    HXRetarget string `json:"hx-retarget"`
    Content    string `json:"content"`
  }{
    HXRetarget: "#target",
    Content:    `<h1>Hello World</h1>`,
  }
})
```

```html
<body hx-ext="call">
  ...
  <div id="target"></div>
  <button hx-call="hello-world" >Click Me</button>
  ...
</body>

```

You can change the swap type by adding the `hx-reswap` field to the return value

```go
w := webview.New(false)
w.Bind('hello-world', func () struct {
    HXReswap   string `json:"hx-retarget"`
    Content    string `json:"content"`
  } {
  return struct {
    HXReswap string `json:"hx-retarget"`
    Content  string `json:"content"`
  }{
    HXReswap: "afterend",
    Content:  `<h1>Hello World</h1>`,
  }
})
```

```html
<body hx-ext="call">
  ...
  <div id="target"></div>
  <button hx-call="hello-world" >Click Me</button>
  ...
</body>

```

This library includes some helpers for go

```shell
go get github.com/sabotageresearch/htmx-bind-webview/go@main
```

```go
import htmx "github.com/sabotageresearch/htmx-bind-webview/go"
w := webview.New(false)
w.Bind('hello-world', func (f htmx.FormData) htmx.Result {
  v := f.Values
  return htmx.Result{
    HXReswap:              htmx.SwapAfterEnd,
    HXRetarget:            "#target",
    HXTrigger: 		   "htmx:click",
    HXTriggerAfterSwap:    "htmx:click",
    HXTriggerAfterSettle:  "htmx:click",
    Content:               "<h1>"+v["text"]+"</h1>",
  }
})
```
