const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { Builder, By, until } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

const port = 4173;
const baseUrl = `http://localhost:${port}`;
let server;
let driver;

function createBrowserBuilder() {
  const firefoxPaths = [
    process.env.FIREFOX_PATH,
    "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
  ].filter(Boolean);
  const firefoxPath = firefoxPaths.find((candidate) => fs.existsSync(candidate));
  const options = new firefox.Options().addArguments("-headless", "--width=1280", "--height=900");

  if (firefoxPath) {
    options.setBinary(firefoxPath);
  }

  return new Builder().forBrowser("firefox").setFirefoxOptions(options);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // The local server may need a moment to begin listening.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("The test server did not start in time.");
}

beforeAll(async () => {
  server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });

  await waitForServer();
  driver = await createBrowserBuilder().build();
});

beforeEach(async () => {
  await driver.get(baseUrl);
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }

  if (server) {
    server.kill();
  }
});

test("page opens", async () => {
  const heading = await driver.wait(until.elementLocated(By.css("h1")), 5000);

  await expect(driver.getTitle()).resolves.toContain("Contact Form");
  await expect(heading.getText()).resolves.toBe("Contact form");
});

test("form exists", async () => {
  await expect(driver.findElement(By.id("contact-form"))).resolves.toBeDefined();
  await expect(driver.findElement(By.id("name"))).resolves.toBeDefined();
  await expect(driver.findElement(By.id("email"))).resolves.toBeDefined();
  await expect(driver.findElement(By.css("button[type='submit']"))).resolves.toBeDefined();
});

test("empty form shows an error message", async () => {
  await driver.findElement(By.css("button[type='submit']")).click();

  const message = await driver.findElement(By.id("form-message"));
  await expect(message.getText()).resolves.toBe("Please fill in all fields.");
  await expect(message.getAttribute("class")).resolves.toContain("error");
});

test("valid form shows a success message", async () => {
  await driver.findElement(By.id("name")).sendKeys("Student");
  await driver.findElement(By.id("email")).sendKeys("student@example.com");
  await driver.findElement(By.css("button[type='submit']")).click();

  const message = await driver.findElement(By.id("form-message"));
  await expect(message.getText()).resolves.toBe("Form submitted successfully!");
  await expect(message.getAttribute("class")).resolves.toContain("success");
});
