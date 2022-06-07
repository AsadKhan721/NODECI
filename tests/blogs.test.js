const Page = require("./helpers/Page");
let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});
afterEach(async () => {
  // browser will be closed
  await page.close();
});
describe("When logged in", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a[href='/blogs/new']");
  });

  test("User can see create form", async () => {
    const labelText = await page.getContent(".title label");
    const contentText = await page.getContent(".content label");
    expect(labelText).toBe("Blog Title");
    expect(contentText).toBe("Content");
  });
  describe("if inputs are invalid", () => {
    beforeEach(async () => {
      await page.click("form button[type='submit']");
    });
    test("form Must show error message regarding error", async () => {
      await page.waitFor(".title .red-text");
      const titleErrorMessage = await page.getContent(".title .red-text");
      const contentErrorMessage = await page.getContent(".content .red-text");
      expect(titleErrorMessage).toBe("You must provide a value");
      expect(contentErrorMessage).toBe("You must provide a value");
    });
  });
  describe("If inputs are valid", () => {
    let [title, content] = ["Blog Title", "Blog Content"];
    beforeEach(async () => {
      await page.type(".title input", title);
      await page.type(".content input", content);
      await page.click("form button[type='submit']");
    });
    test("When clicked on Next Button Review Section is displayed", async () => {
      // await page.waitFor("form h5");
      const headingText = await page.getContent("form h5");
      expect(headingText).toBe("Please confirm your entries");
    });
    test("When Clicked on Save Button, New Blog is created", async () => {
      await page.click(".green");
      await page.waitFor(".card .card-title");
      const titleText = await page.getContent(".card .card-title");
      const contentText = await page.getContent(".card p");
      expect(titleText).toBe(title);
      expect(contentText).toBe(content);
    });
  });
});

describe("when user is not logged in", () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: { title: "Blog Title", content: "Blog Content" },
    },
  ];
  test("user cannot do send request to Api", async () => {
    const responses = await page.execActions(actions);
    for (let response of responses) {
      expect(response).toEqual({ error: "You must log in!" });
    }
  });
  // test("user cannot get blogs", async () => {
  //   // the reason why i am sending in request in browser because
  //   // it is more related to user interacting with our app
  //   const response = await page.get("/api/blogs");
  //   console.log(response);
  //   expect(response).toEqual({ error: "You must log in!" });
  // });
  // test("user cannot create new posts", async () => {
  //   const response = await page.post("/api/blogs", {
  //     title: "Title",
  //     content: "Content",
  //   });
  //   expect(response).toEqual({ error: "You must log in!" });
  // });
});
