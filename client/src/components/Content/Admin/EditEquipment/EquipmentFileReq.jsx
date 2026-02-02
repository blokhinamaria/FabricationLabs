import { useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";

export default function EquipmentFileReq({ file, onUpdate }) {
    const [fileText, setFileText] = useState(file || "");
    const [markdownText, setMarkdownText] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const dialogRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        setFileText(file || "");
    }, [file]);

    const sanitizedFileText = sanitizeHtml(fileText || "", {
        allowedTags: ["br", "p", "div", "ul", "ol", "li", "strong", "b", "em", "i", "h1", "h2", "h3", "h4", "h5", "h6"],
        allowedAttributes: {},
        allowedSchemes: [],
    });

    function escapeHtml(text = "") {
        return text
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function inlineMarkdownToHtml(text = "") {
        const escaped = escapeHtml(text);
        return escaped
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/__(.+?)__/g, "<strong>$1</strong>");
    }

    function markdownToHtml(markdown = "") {
        const lines = markdown.replace(/\r\n/g, "\n").split("\n");
        let html = "";
        let inList = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed) {
                if (inList) {
                    html += "</ul>";
                    inList = false;
                }
                continue;
            }

            const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                if (inList) {
                    html += "</ul>";
                    inList = false;
                }
                const level = headingMatch[1].length;
                html += `<h${level}>${inlineMarkdownToHtml(headingMatch[2])}</h${level}>`;
                continue;
            }

            const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
            if (bulletMatch) {
                if (!inList) {
                    html += "<ul>";
                    inList = true;
                }
                html += `<li>${inlineMarkdownToHtml(bulletMatch[1])}</li>`;
                continue;
            }

            if (inList) {
                html += "</ul>";
                inList = false;
            }
            html += `<p>${inlineMarkdownToHtml(trimmed)}</p>`;
        }

        if (inList) {
            html += "</ul>";
        }

        return sanitizeHtml(html, {
            allowedTags: ["br", "p", "ul", "li", "strong", "b", "h1", "h2", "h3", "h4", "h5", "h6"],
            allowedAttributes: {},
            allowedSchemes: [],
        });
    }

    function nodeToMarkdown(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const element = node;
        const tag = element.tagName.toLowerCase();
        const inner = Array.from(element.childNodes).map(nodeToMarkdown).join("");

        if (tag === "strong" || tag === "b") {
            return `**${inner}**`;
        }
        if (tag === "br") {
            return "\n";
        }
        return inner;
    }

    function htmlToMarkdown(html) {
        const clean = sanitizeHtml(html || "", {
            allowedTags: ["br", "p", "div", "ul", "ol", "li", "strong", "b", "em", "i", "h1", "h2", "h3", "h4", "h5", "h6"],
            allowedAttributes: {},
            allowedSchemes: [],
        });

        if (!clean.trim()) {
            return "";
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${clean}</div>`, "text/html");
        const root = doc.body.firstElementChild;
        const lines = [];

        root?.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) lines.push(text);
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const element = node;
            const tag = element.tagName.toLowerCase();

            if (tag === "ul" || tag === "ol") {
                element.querySelectorAll("li").forEach((li) => {
                    const line = nodeToMarkdown(li).trim();
                    if (line) lines.push(`- ${line}`);
                });
                lines.push("");
                return;
            }

            const text = nodeToMarkdown(element).trim();
            if (!text) return;

            if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
                const level = Number(tag[1]);
                lines.push(`${"#".repeat(level)} ${text}`);
            } else {
                lines.push(text);
            }
            lines.push("");
        });

        return lines.join("\n").trim();
    }

    const currentHtml = useMemo(() => markdownToHtml(markdownText), [markdownText]);

    function insertAtSelection(prefix, suffix = "") {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const selected = markdownText.slice(start, end);
        const nextValue =
            markdownText.slice(0, start) +
            prefix +
            selected +
            suffix +
            markdownText.slice(end);

        setMarkdownText(nextValue);
        requestAnimationFrame(() => {
            const cursor = start + prefix.length + selected.length + suffix.length;
            textarea.focus();
            textarea.setSelectionRange(cursor, cursor);
        });
    }

    const openModal = () => {
        setMarkdownText(htmlToMarkdown(fileText || file || ""));
        setFormError("");
        dialogRef.current.showModal();
        setIsDialogOpen(true);
    };

    const closeModal = () => {
        dialogRef.current.close();
        setIsDialogOpen(false);
    };

    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            closeModal();
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const newText = currentHtml;
        setFormError("");

        if (!newText || !markdownText.trim()) {
            setFormError("Add some content first");
            return;
        }

        const originalText = sanitizeHtml(file || "", {
            allowedTags: ["br", "p", "ul", "li", "strong", "b", "h1", "h2", "h3", "h4", "h5", "h6"],
            allowedAttributes: {},
            allowedSchemes: [],
        });

        const isChanged = originalText !== newText;
        if (!isChanged) {
            setFormError("File requirements match the original");
            return;
        }

        const equipmentUpdates = { fileRequirements: newText };

        setLoading(true);
        try {
            await onUpdate(equipmentUpdates);
            setFileText(newText);
            closeModal();
        } catch (err) {
            console.log(err);
            setFormError("Something went wrong. Please try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="flow">
            <h2>File Requirements</h2>
            <div
                className="file-requirements-text"
                dangerouslySetInnerHTML={{ __html: sanitizedFileText }}
                style={{ whiteSpace: "pre-wrap" }}
            />
            <button
                onClick={openModal}
                aria-expanded={isDialogOpen}
                aria-controls="delete-dialog"
                aria-haspopup="dialog"
            >
                Edit
            </button>
            <dialog id="delete-dialog" ref={dialogRef} onClick={handleDialogClick}>
                <div className="dialog-close-button-wrapper">
                    <button type="button" onClick={closeModal} className="dialog-close-button">
                        Close <img alt="" src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <h3>Edit File Requirements</h3>
                    <p>Markdown notebook editor: use `# Title`, `- bullet`, and `**bold**`.</p>

                    <div className="flow" style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px" }}>
                        <div className="input-group-wrapper">
                            <button type="button" className="small" onClick={() => insertAtSelection("# ")}>
                                Title
                            </button>
                            <button type="button" className="small" onClick={() => insertAtSelection("- ")}>
                                Bullet
                            </button>
                            <button type="button" className="small" onClick={() => insertAtSelection("**", "**")}>
                                Bold
                            </button>
                        </div>

                        <label htmlFor="file-requirements-markdown">Editor</label>
                        <textarea
                            id="file-requirements-markdown"
                            ref={editorRef}
                            value={markdownText}
                            onChange={(e) => setMarkdownText(e.target.value)}
                            rows={12}
                            placeholder={"# File Requirements\n- Bring STL files\n- **Use millimeters**"}
                            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                        />
                    </div>

                    <div className="flow">
                        <h4>Preview</h4>
                        <div
                            className="file-requirements-text"
                            style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", borderRadius: "8px", padding: "12px" }}
                            dangerouslySetInnerHTML={{ __html: currentHtml || "<p>No content yet</p>" }}
                        />
                    </div>

                    {formError && <p className="warning" role="alert">{formError}</p>}
                    <button type="submit">{loading ? "Saving" : "Save"}</button>
                </form>
            </dialog>
        </section>
    );
}
