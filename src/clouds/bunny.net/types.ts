const region = {
  de: "de",
  la: "la",
  ny: "ny",
  sg: "sg",
};

export interface IUploadFileProps {
  fileContent: Buffer;
  fileName: string;
  path: string;
  StorageZoneId?: string;
}

export interface IBunnyRequestProps {
  AccessKey: string;
  PullZoneName: string;
  Region: keyof typeof region | string;
  StorageZoneHostnames: string[];
  StorageZoneId: string;
  StorageZoneName: string;
  StorageZonePassword: string;
  Type: number;
  ZoneTier: number;
}

export interface StorageZoneProps {
  Id: number;
  UserId: string;
  Name: string;
  Password: string;
  DateModified: string;
  Deleted: boolean;
  StorageUsed: number;
  FilesStored: number;
  Region: string;
  ReplicationRegions: any[];
  PullZones: PullZone[];
  ReadOnlyPassword: string;
  Rewrite404To200: boolean;
  Custom404FilePath: any;
  StorageHostname: string;
  ZoneTier: number;
  ReplicationChangeInProgress: boolean;
  PriceOverride: number;
  Discount: number;
}

export interface PullZone {
  Id: number;
  Name: string;
  OriginUrl: string;
  Enabled: boolean;
  Hostnames: Hostname[];
  StorageZoneId: number;
  EdgeScriptId: number;
  AllowedReferrers: any[];
  BlockedReferrers: any[];
  BlockedIps: any[];
  EnableGeoZoneUS: boolean;
  EnableGeoZoneEU: boolean;
  EnableGeoZoneASIA: boolean;
  EnableGeoZoneSA: boolean;
  EnableGeoZoneAF: boolean;
  ZoneSecurityEnabled: boolean;
  ZoneSecurityKey: string;
  ZoneSecurityIncludeHashRemoteIP: boolean;
  IgnoreQueryStrings: boolean;
  MonthlyBandwidthLimit: number;
  MonthlyBandwidthUsed: number;
  MonthlyCharges: number;
  AddHostHeader: boolean;
  OriginHostHeader: string;
  Type: number;
  AccessControlOriginHeaderExtensions: string[];
  EnableAccessControlOriginHeader: boolean;
  DisableCookies: boolean;
  BudgetRedirectedCountries: any[];
  BlockedCountries: any[];
  EnableOriginShield: boolean;
  CacheControlMaxAgeOverride: number;
  CacheControlPublicMaxAgeOverride: number;
  BurstSize: number;
  RequestLimit: number;
  BlockRootPathAccess: boolean;
  BlockPostRequests: boolean;
  LimitRatePerSecond: number;
  LimitRateAfter: number;
  ConnectionLimitPerIPCount: number;
  PriceOverride: number;
  AddCanonicalHeader: boolean;
  EnableLogging: boolean;
  EnableCacheSlice: boolean;
  EnableSmartCache: boolean;
  EdgeRules: any[];
  EnableWebPVary: boolean;
  EnableAvifVary: boolean;
  EnableCountryCodeVary: boolean;
  EnableMobileVary: boolean;
  EnableCookieVary: boolean;
  CookieVaryParameters: any[];
  EnableHostnameVary: boolean;
  CnameDomain: string;
  AWSSigningEnabled: boolean;
  AWSSigningKey: any;
  AWSSigningSecret: any;
  AWSSigningRegionName: any;
  LoggingIPAnonymizationEnabled: boolean;
  EnableTLS1: boolean;
  EnableTLS1_1: boolean;
  VerifyOriginSSL: boolean;
  ErrorPageEnableCustomCode: boolean;
  ErrorPageCustomCode: any;
  ErrorPageEnableStatuspageWidget: boolean;
  ErrorPageStatuspageCode: any;
  ErrorPageWhitelabel: boolean;
  OriginShieldZoneCode: string;
  LogForwardingEnabled: boolean;
  LogForwardingHostname: any;
  LogForwardingPort: number;
  LogForwardingToken: any;
  LogForwardingProtocol: number;
  LoggingSaveToStorage: boolean;
  LoggingStorageZoneId: number;
  FollowRedirects: boolean;
  VideoLibraryId: number;
  DnsRecordId: number;
  DnsZoneId: number;
  DnsRecordValue: any;
  OptimizerEnabled: boolean;
  OptimizerDesktopMaxWidth: number;
  OptimizerMobileMaxWidth: number;
  OptimizerImageQuality: number;
  OptimizerMobileImageQuality: number;
  OptimizerEnableWebP: boolean;
  OptimizerEnableManipulationEngine: boolean;
  OptimizerMinifyCSS: boolean;
  OptimizerMinifyJavaScript: boolean;
  OptimizerWatermarkEnabled: boolean;
  OptimizerWatermarkUrl: string;
  OptimizerWatermarkPosition: number;
  OptimizerWatermarkOffset: number;
  OptimizerWatermarkMinImageSize: number;
  OptimizerAutomaticOptimizationEnabled: boolean;
  PermaCacheStorageZoneId: number;
  OriginRetries: number;
  OriginConnectTimeout: number;
  OriginResponseTimeout: number;
  UseStaleWhileUpdating: boolean;
  UseStaleWhileOffline: boolean;
  OriginRetry5XXResponses: boolean;
  OriginRetryConnectionTimeout: boolean;
  OriginRetryResponseTimeout: boolean;
  OriginRetryDelay: number;
  QueryStringVaryParameters: any[];
  OriginShieldEnableConcurrencyLimit: boolean;
  OriginShieldMaxConcurrentRequests: number;
  EnableSafeHop: boolean;
  CacheErrorResponses: boolean;
  OriginShieldQueueMaxWaitTime: number;
  OriginShieldMaxQueuedRequests: number;
  OptimizerClasses: any[];
  OptimizerForceClasses: boolean;
  UseBackgroundUpdate: boolean;
  EnableAutoSSL: boolean;
  EnableQueryStringOrdering: boolean;
  LogAnonymizationType: number;
  LogFormat: number;
  LogForwardingFormat: number;
  ShieldDDosProtectionType: number;
  ShieldDDosProtectionEnabled: boolean;
  OriginType: number;
  EnableRequestCoalescing: boolean;
  RequestCoalescingTimeout: number;
  OriginLinkValue: string;
  DisableLetsEncrypt: boolean;
  EnableBunnyImageAi: boolean;
  BunnyAiImageBlueprints: BunnyAiImageBlueprint[];
  PreloadingScreenEnabled: boolean;
  PreloadingScreenCode: string;
  PreloadingScreenLogoUrl: any;
  PreloadingScreenTheme: number;
  PreloadingScreenDelay: number;
  EUUSDiscount: number;
  SouthAmericaDiscount: number;
  AfricaDiscount: number;
  AsiaOceaniaDiscount: number;
  RoutingFilters: any[];
}

export interface Hostname {
  Id: number;
  Value: string;
  ForceSSL: boolean;
  IsSystemHostname: boolean;
  HasCertificate: boolean;
  Certificate: any;
  CertificateKey: any;
}

export interface BunnyAiImageBlueprint {
  Name: string;
  Properties: Properties;
}

export interface Properties {
  PrePrompt: string;
  PostPrompt: string;
}
