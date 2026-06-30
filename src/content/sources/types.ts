export type SourceKind =
  | 'company-release'
  | 'company-ir'
  | 'company-filing'
  | 'sec-filing'
  | 'dart-filing'
  | 'kind-filing'
  | 'government'
  | 'industry-data'
  | 'news'
  | 'market-data';

export type SourceAccessType = 'public' | 'restricted';

export interface ContentSource {
  id: string;
  kind: SourceKind;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  publishedLabel?: string;
  note?: string;
  accessType?: SourceAccessType;
}
