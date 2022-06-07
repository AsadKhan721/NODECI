const puppeteer = require("puppeteer");
const sessionFactory = require("../Factories/sessionFactory");
const userFactory = require("../Factories/userFactory");
class Page {
  constructor(page) {
    this.page = page;
  }
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const customPage = new Page(page);
    const proxy = new Proxy(customPage, {
      get(target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
    return proxy;
  }
  async login() {
    // generating User For Test
    const user = await userFactory();
    // generating Session so that we can skip google OAuth
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({
      name: "session",
      value: session,
    });
    await this.page.setCookie({
      name: "session.sig",
      value: sig,
    });
    await this.page.reload();
    await this.page.waitFor("a[href='/auth/logout']");
    // trying to navigate to a page like app do
    await this.page.goto("http://localhost:3000/blogs");
  }
  getContent(query) {
    return this.page.$eval(query, (el) => el.innerHTML);
  }
  get(path) {
    // function for sending get request in browser
    // evaluate is function given by Puppeeteer that takes function as argument
    // which puppeteer will first turn it into string and will send to Chromium instance
    // after which chromium will run this function(turned back into Function from string) and
    // after running this function whatever returned will be returned from page.evaluate
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        method: "GET",
        // this option will send cookies along with every request
        // because fetch will not do it by default
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    }, path);
  }

  post(path, body) {
    // function for sending post request in browser
    // evaluate is function given by Puppeeteer that takes function as argument
    // which puppeteer will first turn it into string and will send to Chromium instance
    // after which chromium will run this function(turned back into Function from string) and
    // after running this function whatever returned will be returned from page.evaluate
    // other arguments will passed to function during runTime on Chromium instance because
    // when function is turned into String it is send without any scope
    // due to which path and body will not available to it which is in its parent Scope
    return this.page.evaluate(
      (_path, _body) => {
        return fetch(_path, {
          method: "POST",
          // this option will send cookies along with every request
          // because fetch will not do it by default
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          // Body is required as json so we will turn JS object into JSON
          body: JSON.stringify(_body),
        }).then((res) => res.json());
      },
      path,
      body
    );
  }
  // function that will runs actions
  execActions(actions = []) {
    /*
    Action Structure
    {
      method:post,get,put,patch,delete
      path:"Some/path",
      data : {}
    }
     */
    // Promise.all takes an Array of promises and will resolve with an array of results
    // if all Promises are resolved
    // other if any of the promise is rejected, this promise is also rejected
    // with first promise rejected message
    return Promise.all(
      actions.map((action = { method: "", path: "", data: {} }) => {
        const { method, path, data } = action;
        if (!this[method]) throw new Error("Oops Method is not defined");

        return this[method](path, data);
      })
    );
  }
}

module.exports = Page;
