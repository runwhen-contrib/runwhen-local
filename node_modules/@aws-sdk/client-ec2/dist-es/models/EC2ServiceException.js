import { ServiceException as __ServiceException, } from "@smithy/smithy-client";
export { __ServiceException };
export class EC2ServiceException extends __ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, EC2ServiceException.prototype);
    }
}
