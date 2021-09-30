const Page = require("./helpers/Page");
describe("Header", () => {
  let page;
  beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
  });
  afterEach(async () => {
    await page.close();
  });
  xit("has correct logo", async () => {
    const text = await page.getElementContent("a.brand-logo");
    expect(text).toBe("Blogster");
  });
  xit("gets into oAuth flow when we click login", async () => {
    await page.click(".right a");
    const url = page.url();
    console.log(url);
  });
  xit("Show logout and myblogs anchor tags on Header when user is loggedin", async () => {
    await page.login();
    const text = await page.getElementContent("a[href='/auth/logout']");
    expect(text).toBe("Logout");
  });
});
