import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AssignIpv6AddressesCommand, se_AssignIpv6AddressesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class AssignIpv6AddressesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AssignIpv6Addresses", {})
    .n("EC2Client", "AssignIpv6AddressesCommand")
    .f(void 0, void 0)
    .ser(se_AssignIpv6AddressesCommand)
    .de(de_AssignIpv6AddressesCommand)
    .build() {
}
