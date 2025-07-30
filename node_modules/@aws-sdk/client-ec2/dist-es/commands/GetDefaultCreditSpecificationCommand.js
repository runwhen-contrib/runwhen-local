import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetDefaultCreditSpecificationCommand, se_GetDefaultCreditSpecificationCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetDefaultCreditSpecificationCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetDefaultCreditSpecification", {})
    .n("EC2Client", "GetDefaultCreditSpecificationCommand")
    .f(void 0, void 0)
    .ser(se_GetDefaultCreditSpecificationCommand)
    .de(de_GetDefaultCreditSpecificationCommand)
    .build() {
}
