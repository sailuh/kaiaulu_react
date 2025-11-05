import { personDummyData } from "../data/person-dummy-data.ts";
import { mailDummyData } from "../data/mail-dummy-data.ts";
import { issueDummyData } from "../data/issue-dummy-data.ts";
import { fileDummyData } from "../data/file-dummy-data.ts";

export function useDummyData() {
    return { personData: personDummyData, mailData: mailDummyData, issueData: issueDummyData, fileData: fileDummyData };
}
