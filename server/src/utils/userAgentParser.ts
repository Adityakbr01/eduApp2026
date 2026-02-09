import { UAParser } from "ua-parser-js";

export const parseUserAgent = (userAgentString: string = ""): string => {
    const parser = new UAParser(userAgentString);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const browserName = browser.name || 'Unknown Browser';
    const osName = os.name || 'Unknown OS';

    return `${browserName} on ${osName}`;
};
