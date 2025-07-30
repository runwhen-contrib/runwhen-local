import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_UnassignIpv6AddressesCommand, se_UnassignIpv6AddressesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class UnassignIpv6AddressesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "UnassignIpv6Addresses", {})
    .n("EC2Client", "UnassignIpv6AddressesCommand")
    .f(void 0, void 0)
    .ser(se_UnassignIpv6AddressesCommand)
    .de(de_UnassignIpv6AddressesCommand)
    .build() {
}
