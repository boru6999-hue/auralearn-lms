  import { getRequestConfig } from "next-intl/server";

  export default getRequestConfig(async () => {
    return {
      locale: "mn",
      messages: (await import("../messages/mn.json")).default,
    };
  });
