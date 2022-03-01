import {
  convertToQueryParams,
  GEN_TEMPLATE_FORM_ROUTE,
  GEN_TEMPLATE_URL,
} from "constants/routes";
import { APP_MODE } from "entities/App";
import getQueryParamsObject from "utils/getQueryParamsObject";

export const LEGACY_URL_APP_VERSION = 1;
export const SLUG_URL_APP_VERSION = 2;

const fetchParamsToPersist = () => {
  const existingParams = getQueryParamsObject() || {};

  // not persisting the entire query currently, since that's the current behaviour
  const { branch, embed } = existingParams;
  let params = { branch, embed } as any;

  // test param to make sure a query param is present in the URL during dev and tests
  if ((window as any).Cypress) {
    params = { a: "b", ...params };
  }

  return params;
};

type Optional<T extends { [k in keyof T]: T[k] }> = {
  [K in keyof T]+?: T[K];
};

type BaseURLBuilderParams = {
  applicationId: string;
  applicationSlug: string;
  pageId: string;
  pageSlug: string;
  applicationVersion: number;
};

type URLBuilderParams = BaseURLBuilderParams & {
  suffix: string;
  branch: string;
  hash: string;
  params: Record<string, any>;
};

export const DEFAULT_BASE_URL_BUILDER_PARAMS = {
  applicationId: "",
  applicationSlug: "",
  pageId: "",
  pageSlug: "",
  applicationVersion: 1,
};

let BASE_URL_BUILDER_PARAMS = DEFAULT_BASE_URL_BUILDER_PARAMS;

export function updateURLFactory(params: Optional<BaseURLBuilderParams>) {
  BASE_URL_BUILDER_PARAMS = { ...BASE_URL_BUILDER_PARAMS, ...params };
}

function baseURLBuilder(
  {
    applicationId,
    applicationSlug,
    applicationVersion,
    pageId,
    pageSlug,
    ...rest
  }: Optional<URLBuilderParams>,
  mode: APP_MODE = APP_MODE.EDIT,
): string {
  const { hash = "", params = {}, suffix } = { ...rest };

  applicationVersion =
    applicationVersion ?? BASE_URL_BUILDER_PARAMS.applicationVersion;
  const shouldUseLegacyURLs = applicationVersion <= 1;

  let basePath = "";
  pageId = pageId || BASE_URL_BUILDER_PARAMS.pageId;
  if (shouldUseLegacyURLs) {
    applicationId = applicationId || BASE_URL_BUILDER_PARAMS.applicationId;
    basePath = `/applications/${applicationId}/pages/${pageId}`;
  } else {
    applicationSlug =
      applicationSlug || BASE_URL_BUILDER_PARAMS.applicationSlug;
    pageSlug = pageSlug || BASE_URL_BUILDER_PARAMS.pageSlug;
    basePath = `/${applicationSlug}/${pageSlug}-${pageId}`;
  }
  basePath += mode === APP_MODE.EDIT ? "/edit" : "";

  const paramsToPersist = fetchParamsToPersist();
  const modifiedParams = { ...paramsToPersist, ...params };
  const queryString = convertToQueryParams(modifiedParams);
  const suffixPath = suffix ? `/${suffix}` : "";
  const hashPath = hash ? `#${hash}` : "";

  // hash fragment should be at the end of the href
  // ref: https://www.rfc-editor.org/rfc/rfc3986#section-4.1
  return `${basePath}${suffixPath}${queryString}${hashPath}`;
}

export const pageListEditorURL = (
  props?: Optional<URLBuilderParams>,
): string => {
  return baseURLBuilder({
    ...props,
    suffix: "pages",
  });
};
export const datasourcesEditorURL = (
  props?: Optional<URLBuilderParams>,
): string =>
  baseURLBuilder({
    ...props,
    suffix: "datasource",
  });

export const datasourcesEditorIdURL = (
  props: Optional<URLBuilderParams> & {
    datasourceId: string;
  },
): string => {
  return baseURLBuilder({
    ...props,
    suffix: `datasource/${props.datasourceId}`,
  });
};

export const jsCollectionIdURL = (
  props: Optional<URLBuilderParams> & {
    collectionId: string;
  },
): string => {
  return baseURLBuilder({
    ...props,
    suffix: `jsObjects/${props.collectionId}`,
  });
};

export const integrationEditorURL = (
  props: Optional<URLBuilderParams> & { selectedTab: string },
): string => {
  const suffixPath = props.suffix ? `/${props.suffix}` : "";
  return baseURLBuilder({
    ...props,
    suffix: `datasources/${props.selectedTab}${suffixPath}`,
  });
};

export const queryEditorIdURL = (
  props: Optional<URLBuilderParams> & {
    queryId: string;
  },
): string =>
  baseURLBuilder({
    ...props,
    suffix: `queries/${props.queryId}`,
  });

export const apiEditorIdURL = (
  props: Optional<URLBuilderParams> & {
    apiId: string;
  },
): string =>
  baseURLBuilder({
    ...props,
    suffix: `api/${props.apiId}`,
  });

export const curlImportPageURL = (props?: Optional<URLBuilderParams>): string =>
  baseURLBuilder({
    ...props,
    suffix: "api/curl/curl-import",
  });

export const providerTemplatesURL = ({
  providerId,
}: Optional<URLBuilderParams> & {
  providerId: string;
}): string =>
  baseURLBuilder({
    suffix: `api/provider/${providerId}`,
  });

export const saasEditorDatasourceIdURL = (
  props: Optional<URLBuilderParams> & {
    pluginPackageName: string;
    datasourceId: string;
  },
): string =>
  baseURLBuilder({
    ...props,
    suffix: `saas/${props.pluginPackageName}/datasources/${props.datasourceId}`,
  });

export const saasEditorApiIdURL = (
  props: Optional<URLBuilderParams> & {
    pluginPackageName: string;
    apiId: string;
  },
): string =>
  baseURLBuilder({
    ...props,
    suffix: `saas/${props.pluginPackageName}/api/${props.apiId}`,
  });

export const generateTemplateURL = (
  props?: Optional<URLBuilderParams>,
): string =>
  baseURLBuilder({
    ...props,
    suffix: GEN_TEMPLATE_URL,
  });

export const generateTemplateFormURL = (
  props?: Optional<URLBuilderParams>,
): string =>
  baseURLBuilder({
    ...props,
    suffix: `${GEN_TEMPLATE_URL}${GEN_TEMPLATE_FORM_ROUTE}`,
  });

export const onboardingCheckListUrl = (
  props?: Optional<URLBuilderParams>,
): string =>
  baseURLBuilder({
    ...props,
    suffix: "checklist",
  });

export const builderURL = (props?: Optional<URLBuilderParams>): string => {
  return baseURLBuilder({ ...props });
};

export const viewerURL = (props?: Optional<URLBuilderParams>): string => {
  return baseURLBuilder({ ...props }, APP_MODE.PUBLISHED);
};
