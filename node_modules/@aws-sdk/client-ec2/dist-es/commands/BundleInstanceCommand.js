import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { BundleInstanceRequestFilterSensitiveLog, BundleInstanceResultFilterSensitiveLog, } from "../models/models_0";
import { de_BundleInstanceCommand, se_BundleInstanceCommand } from "../protocols/Aws_ec2";
export { $Command };
export class BundleInstanceCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "BundleInstance", {})
    .n("EC2Client", "BundleInstanceCommand")
    .f(BundleInstanceRequestFilterSensitiveLog, BundleInstanceResultFilterSensitiveLog)
    .ser(se_BundleInstanceCommand)
    .de(de_BundleInstanceCommand)
    .build() {
}
