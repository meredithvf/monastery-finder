import styles from "./communities.module.css";
import {
  getSectionForField,
  WEBSITE_CONTENT_LABELS,
} from "@/lib/website-content";
import {
  WEBSITE_CONTENT_FIELDS,
  type CommunityWebsiteContent,
  type WebsiteContentSection,
} from "@/lib/types/community";

function ContentSectionBlock({ section }: { section: WebsiteContentSection }) {
  return (
    <article className={styles.pageBlock}>
      <div className={styles.pageContent}>
        {section.content.split(/\n{2,}/).map((paragraph, i) => (
          <p key={i}>{paragraph.trim()}</p>
        ))}
      </div>
    </article>
  );
}

export function WebsiteContentSections({
  content,
}: {
  content: CommunityWebsiteContent;
}) {
  const fieldsWithContent = WEBSITE_CONTENT_FIELDS.filter(
    (field) => getSectionForField(content, field) != null,
  );

  if (fieldsWithContent.length === 0) return null;

  return (
    <>
      {fieldsWithContent.map((field) => {
        const section = getSectionForField(content, field);
        if (!section) return null;
        return (
          <section key={field} className={styles.section}>
            <h2>{WEBSITE_CONTENT_LABELS[field]}</h2>
            <ContentSectionBlock section={section} />
          </section>
        );
      })}
    </>
  );
}
