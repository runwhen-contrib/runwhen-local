import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetInstanceTpmEkPubResultFilterSensitiveLog, } from "../models/models_6";
import { de_GetInstanceTpmEkPubCommand, se_GetInstanceTpmEkPubCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetInstanceTpmEkPubCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetInstanceTpmEkPub", {})
    .n("EC2Client", "GetInstanceTpmEkPubCommand")
    .f(void 0, GetInstanceTpmEkPubResultFilterSensitiveLog)
    .ser(se_GetInstanceTpmEkPubCommand)
    .de(de_GetInstanceTpmEkPubCommand)
    .build() {
}
