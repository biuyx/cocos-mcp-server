/**
 * Best-effort fallback for slightly-malformed JSON before parsing.
 *
 * Conservative on purpose (fork hardening): the previous version globally rewrote
 * single quotes to double quotes and escaped every control char, which corrupts
 * valid string content (apostrophes, embedded newlines/tabs in string values).
 * Compliant MCP clients send valid JSON, so we only strip a BOM and trailing
 * commas — enough to salvage common hand-authored mistakes without mangling data.
 */
export function fixCommonJsonIssues(jsonStr: string): string {
    let fixed = jsonStr;
    if (fixed.charCodeAt(0) === 0xFEFF) fixed = fixed.slice(1); // strip BOM
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');                // drop trailing commas
    return fixed;
}
