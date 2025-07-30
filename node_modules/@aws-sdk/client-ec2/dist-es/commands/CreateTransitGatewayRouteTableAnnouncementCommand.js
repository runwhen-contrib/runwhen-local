import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateTransitGatewayRouteTableAnnouncementCommand, se_CreateTransitGatewayRouteTableAnnouncementCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class CreateTransitGatewayRouteTableAnnouncementCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateTransitGatewayRouteTableAnnouncement", {})
    .n("EC2Client", "CreateTransitGatewayRouteTableAnnouncementCommand")
    .f(void 0, void 0)
    .ser(se_CreateTransitGatewayRouteTableAnnouncementCommand)
    .de(de_CreateTransitGatewayRouteTableAnnouncementCommand)
    .build() {
}
