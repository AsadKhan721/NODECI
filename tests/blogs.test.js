const Page = require("./helpers/Page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});
afterEach(async () => {
  await page.close();
});
describe("When not Logged in", async () => {
  test.only("User can not create a new Blog if user is not logged in", async () => {
    const response = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin", // this is send cookies along this request if any are set
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Blog",
          content: "SOme new Content",
        }),
      }).then((res) => res.json());
    });
    console.log(response);
    expect(response.error).toBe("You must log in!");
  });
});

describe("When Logged in", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a[href='/blogs/new']");
  });
  test("User clicks on add button on /blogs page, user must see a create Blog Form", async () => {
    const titleInput = await page.getElement("input[name='title']");
    const contentInput = await page.getElement("input[name='content']");
    expect(titleInput).not.toBeNull();
    expect(contentInput).not.toBeNull();
  });
  describe("when form inputs are valid", () => {
    beforeEach(async () => {
      await page.type(".title input[name='title']", "Hello");
      await page.type(".content input[name='content']", "World");
      await page.click("form button[type='submit']");
    });
    test("if form is submitted user must goto review screen", async () => {
      const formTitle = await page.getElementContent("form h5");
      expect(formTitle).toBe("Please confirm your entries");
    });
    test("if save button review page is clicked blog must be stored to the db", async () => {
      await page.click("form .green");
      await page.waitFor(".card");
      const blogTitle = await page.getElementContent(".card .card-title");
      const blogContent = await page.getElementContent(".card p");
      expect(blogTitle).toBe("Hello");
      expect(blogContent).toBe("World");
    });
  });
  describe("when form inputs are invalid", () => {
    beforeEach(async () => {
      await page.click("form button[type='submit']");
    });
    test("if form is submitted user must see error messages", async () => {
      const titleErrMessage = await page.getElementContent(".title .red-text");
      const contentErrMessage = await page.getElementContent(
        ".content .red-text"
      );
      expect(titleErrMessage).toBe("You must provide a value");
      expect(contentErrMessage).toBe("You must provide a value");
    });
  });
});
