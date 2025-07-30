import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTrunkInterfaceAssociationsCommand, se_DescribeTrunkInterfaceAssociationsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTrunkInterfaceAssociationsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTrunkInterfaceAssociations", {})
    .n("EC2Client", "DescribeTrunkInterfaceAssociationsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTrunkInterfaceAssociationsCommand)
    .de(de_DescribeTrunkInterfaceAssociationsCommand)
    .build() {
}
