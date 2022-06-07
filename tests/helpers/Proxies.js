/*
Proxies let us manage Access to Multiple Objects 
instead of using multiple object we can create one proxy and 
access all objects functionalities
let take an Example  
Greeting class which is a Library that offers 2 Functions that say hello in multiple Languages
like English french
so what i need is to be able to say hello in urdu Language for which i need to update Greeting Class from 
Some external Library which i can but i need some other way due to which i need a Class called OtherGreetings
which will include urdu function but problem is i have to handle multiple Objects here is when proxy
comes to help us
*/

class Greeting {
  english() {
    console.log("Hello");
  }
  french() {
    console.log("Hello in french");
  }
}

class OtherGreetings {
  urdu() {
    console.log("Asalam Wailakum");
  }
}

const greeting = new Greeting();
const otherGreet = new OtherGreetings();

/*
    Proxy is an Contructor Function that takes 2 arguments
    1). target which is object that we want to manage access to.
    2). object that will get function etc
    3). get function will be called when access property on proxy instance
        get takes 2 arguments first target that is Proxy function
        and property which is passed to proxy instance as property
*/
const greetProxy = new Proxy(otherGreet, {
  get: function (target, property) {
    return greeting[property] || target[property];
  },
});

greetProxy.english();
greetProxy.french();
greetProxy.urdu();
