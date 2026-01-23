/**
 * CSL-JSON Name structure
 * @see https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html
 */
export interface CslName {
  family?: string;
  given?: string;
  literal?: string;
  suffix?: string;
  'non-dropping-particle'?: string;
  'dropping-particle'?: string;
}
