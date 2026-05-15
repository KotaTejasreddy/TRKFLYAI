const { execSync } = require("child_process");
const path = require("path");

process.chdir(path.join(__dirname, "frontend"));
require("child_process").spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: path.join(__dirname, "frontend"),
});
