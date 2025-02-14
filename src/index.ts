import appFactory from "./appFactory.js";
import { populate, wait } from "./handlers/poll.js";
import { compareTwoStrings, isLike } from "./utils/isLike.js";

const port = process.env.PORT ?? "9001";

void (async () => {
  // const { expressApp, shutdown } = await appFactory();

  // const server = expressApp.listen(port, () => {
  //   console.log(`App listening on port ${port}`);
  // });

  while (true) {
    await populate();
    await wait(5000);
  }

  // console.log(isLike("dune 2", "de*")); // true
  // console.log(isLike("world", "w*d")); // true
  // console.log(isLike("apple", "app?")); // true
  // console.log(isLike("banana", "appl?")); // false

  // console.log(compareTwoStrings("apple", "appl")); // 0.8
  // console.log(compareTwoStrings("dune 2", "Moonlight")); // 0.8
  // console.log(compareTwoStrings("dune 2", "Dune: Part Two")); // 0.8
})();
