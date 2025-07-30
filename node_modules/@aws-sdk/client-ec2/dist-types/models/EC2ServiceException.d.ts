import { ServiceException as __ServiceException, ServiceExceptionOptions as __ServiceExceptionOptions } from "@smithy/smithy-client";
export type { __ServiceExceptionOptions };
export { __ServiceException };
/**
 * @public
 *
 * Base exception class for all service exceptions from EC2 service.
 */
export declare class EC2ServiceException extends __ServiceException {
    /**
     * @internal
     */
    constructor(options: __ServiceExceptionOptions);
}
