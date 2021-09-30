const puppeteer = require("puppeteer");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new Page(page);
    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      },
    });
  }
  constructor(page) {
    this.page = page;
  }
  async getElementContent(selector) {
    const text = await this.page.$eval(selector, (el) => el.innerHTML);
    return text;
  }
  getElement(selector) {
    return this.page.$eval(selector, (el) => el);
  }
  async login() {
    // Faking session
    // Take user id from db and assign to a variable
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: "session", value: session }); // setting up session cookie on chromium instance
    await this.page.setCookie({ name: "session.sig", value: sig }); // setting up session.sig cookie on chromium instance
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor("a[href='/auth/logout']");
  }
}

module.exports = Page;
