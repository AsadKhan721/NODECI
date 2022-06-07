const Page = require("./helpers/Page");
describe("Header Component", () => {
  let page;
  beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
  });
  afterEach(async () => {
    await page.close();
  });
  it("must show header Content ", async () => {
    /* 
    $eval takes 2 arguments 
    1). selector used to select element 
    2). function which will give use access to Element as Argument
        the reason puppeteer takes second argument as function because 
        puppetter runs in nodeJs and chromium runs completely separately
        due to which this query will send to chromium instance and second function 
        is turned into string and communicated to chromium instance so that we can get 
        our Element
    */
    const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
    expect(text).toBe("Blogster");
  });
  // Faking Google AuthFlow by setting Cookie on our Page Instance which show Tab(session)
  it("must show logout button if user if loggedin", async () => {
    await page.login();
    const logoutLinkText = await page.$eval(
      "a[href='/auth/logout']",
      (el) => el.innerHTML
    );
    expect(logoutLinkText).toMatch(/logout/i);
  });
});
