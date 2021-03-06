## Overview
Synchronous calls happen one after the other, in sequence. Asynchronous code is not guaranteed to happen in a single unbroken sequence. In fact there is no guarantee in the sequence in which async calls will complete, if they complete at all(the request might fail).

Callbacks were the default technique for handling asynchronous requests in es5. You pass a callback to a function which is called  at some point in the future when an event, e.g file download completes, occurs.

```javascript
const loadImage = (src, parent, callback) => {
    let img = document.createElement('img');
    img.src = src;
    img.onload = callback;
    parent.appendChild(img);
}
```


Although it works well, there are a number of issues:
 * handling errors
 * your callback is also an asynchronous task, so you need to pass it a callback. This leads to nesting callbacks that can very quickly become difficult to manage and debug. 'Callback Hell/Pyramid of Doom.
 
A promise can be in one of 4 states:
 * Fulfilled/Resolved: -action related to the promise succeeded
 * Rejected - the action failed.
 * Pending - waiting, neither fulfilled or rejected.
 * Settled - the promise is complete, it's either fulfilled or rejected.
 
 * Promises can settle/execute only once, as opposed to events or callbacks that can be called many times
 * Promises are settled in the main thread, means they could potentially be blocking if the promise takes a long time to complete. Processes that occur in the main thread and take a long time to complete do NOT benefit from being wrapped in a promise.
 * Processes that are synchronous do NOT benefit from being wrapped in promises.
 * Use promises to wrap asynchronous processes, e.g retrieving data from a remote server, posting messages between a web worker (background thread) and the main thread.
 * with promises you effectively decide what constitutes fulfillment and what constitutes rejection.
 
### Creating Promises
Promises can be 'viewed' as a try/catch wrapper around an asynchronous operation.

```javascript
new Promise((resolve, reject) => {
    let value = doSomething();
    if(value) resolve(value);
    else reject(new Error('Failed!'));
})
.then((value) => console.log(value))
.catch((err) => console.log(err));
```

'Promisified' version of imageLoader, in this case the images OnLoad and OnError functions specify success and failure respectively, resolve is called when the image finishes loading.

```javascript
new Promise((resolve, reject) => {
    let img = document.createElement('img');
    img.src = 'image.jpg';
    img.onload = resolve;
    img.onError = reject;
    document.body.appendChild(img);
})
.then()
.catch()
```

In the next example, the js engine does not immediately stop executing the function when resolve is called, all three log messages are printed, event though 'second' comes after resolve() is called.

```javascript
new Promise(function(resolve) {
  console.log('first');
  resolve();
  console.log('second');
}).then(function() {
  console.log('third');
});
```

When resolve() or reject() is called the promise is settled and either .then() or ,catch() are called. Any value received by resolve() or resolve() is passed along to then()/catch() respectively (resolve() passes value to then() and reject() to catch()). If an error occurs anywhere else in the body of the function, the error is automatically passed to catch().
 
If no value is passed, then()/catch() receives undefined. 

If the value that is passed is a promise, the promise executes first, and what ever value it resolves to will be passed to the next link in the chain.


### Thenable
With the promise API, .then also return promises. Which means you can append another .then() and so chain a promise. The .then just has to return a value. Any method or object that returns a .then is thenable. Anything thenable can thus become part of a chain of asynchronous work. In addition .catch() is thenable.

Promises, .then and .catch are thenable. Each link in the chain receives either the fulfilled value of the previous promise or the return value of the previous .then. Thus you can pass information collected from one async task to the next. This is an extremely powerful technique for simplifying complex sequences of async work.


### Error Handling

```javascript
get('example.json').then(resolveFn).catch(rejectFn);


get('example.com').then(resolveFn).then(undefined, rejectFn);
```


These two blocks of code are equivalent. The then function takes two args, if the promise resolves the first (onFulfilled) function is called, if the promise rejects, then the 2nd (onRejected) function is called. If the promise resolves and the next then does not have an onFulfilled function, then is skipped and the next then with a onFulfilled function is called. In all cases when a promise rejects, the javascript engine jumps to the next onRejected function in the chain, whether it's in a then() or catch() method.
 
You can use either then(onFulfilled, onRejected) or catch(onRejected) to handle errors. Generally recommended that you use the latter since when using then with a 2 method signature only one of those arguments can be called, never both. When using then() followed with catch(), both can be called. If you're using a two arg then(), if there's an error with onFulfilled, you need another then() or catch() down the line to catch it. Instead if you use then() with a single arg, followed by a catch(), the same error would be caught by the catch().


### Chaining
There are two strategies for performing multiple asynchronous actions, they can be executed one after the other, a series, or they can be executed in parallel. One the result of one promise depends upon the input of a previous one, the promises need to executed in sequence, one after the other, e.g the quiz where you diplayed a planet, the second task depended upon a result being returned from the first.  Many times, e.g. downloading files, the operations can be executed in parallel so as to improve the performance of the app. The only problem is that you cannot guarantee the order in which the tasks complete and so the order in which you receive the results - the promises can resolve in a different order in which they were created.

Synchronous code is always in series, asynchronous code can be either in series or parallel.

We can use array methods such as map() and forEach() to control the order in which promises resolve.


### Promise.all()
Takes an array of promises, executes them and then returns the results in the same order as the array of promises, and each promise is executed in parallel But, .all() fails fast, if one of the promises rejects it does not wait on the remaining promises, they all reject. Once they all resolve, the next then() in the chain receives the array of values.