import type { Issue } from "menhir/form/standard-schema";

export type Proposal = {
  title: string;
  speaker: { name: string; email: string };
  links: string[];
};

// Any schema library that implements Standard Schema fits here. This schema
// is written by hand, so that the example depends on none.
export const proposalSchema = {
  "~standard": {
    version: 1,
    vendor: "example",
    validate(value: Proposal) {
      const issues: Issue[] = [];
      if (!value.title.trim()) {
        issues.push({ message: "Give the talk a title.", path: ["title"] });
      }
      if (!value.speaker.name.trim()) {
        issues.push({ message: "Enter your name.", path: ["speaker", "name"] });
      }
      value.links.forEach((link, i) => {
        if (!URL.canParse(link)) {
          issues.push({
            message: "Enter a full address, with https://.",
            path: ["links", i],
          });
        }
      });
      // No path: an error of the whole form, under "".
      if (value.links.length === 0) {
        issues.push({ message: "Add a link to a recording or slides." });
      }
      return issues.length > 0 ? { issues } : { value };
    },
  },
} as const;
