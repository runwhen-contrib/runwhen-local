import { Paginator } from "@smithy/types";
import { DescribeCertificatesCommandInput, DescribeCertificatesCommandOutput } from "../commands/DescribeCertificatesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeCertificates: (config: RDSPaginationConfiguration, input: DescribeCertificatesCommandInput, ...rest: any[]) => Paginator<DescribeCertificatesCommandOutput>;
