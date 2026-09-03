Read and analyze `.athena/docs/` directory as the source of truth for documentation.
Generate `llms.txt` following the format below (llmstxt.org). llms.txt is
links + one-line descriptions only — never inline doc content.
Put it in the public directory so it can be accessed by the public.

```markdown
# Project Name

> One-sentence project summary.

## Docs

- [Doc title](https://example.com/docs/page.md): one-line description

## Optional

- [Secondary resource](https://example.com/other.md): one-line description
```

## Additional requests

<additional_requests>
$ARGUMENTS
</additional_requests>
