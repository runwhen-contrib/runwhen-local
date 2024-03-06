# Level of Detail

### Level of Detail

The matching of code bundles and generation of SLX info in the generated workspace is controlled by a **level of detail** (LOD) setting, which can be specified at the level of a platform-specific scoping construct. For example, for Kubernetes the LOD scoping is the namespace and for Azure it's the resource group. The LOD lets the user control how detailed the generated SLX information is for each scope. Each match rule for a code bundle has an associated LOD setting. And each scope for a cloud platform also has a LOD (or a default value is used if one isn't set explicitly for a scope). When a match is found the match rule LOD value is compared against the resource scope LOD value. If the scope LOD value is greater (i.e. more detailed) than the match rule LOD value, then the match rule is enabled and emits the associated SLXs.

The values for the level of detail are:

| String Value | Integer Value | Description                              |
| ------------ | ------------- | ---------------------------------------- |
| none         | 0             | No SLXs are generated                    |
| basic        | 1             | Only basic SLXs are generated            |
| detailed     | 2             | All matching/relevant SLXs are generated |

{% hint style="info" %}
In earlier versions of RunWhen Local the LOD values were integer values rather than string values. These integer values are still supported for backwards compatibility, but are deprecated. You may still see them in some existing code bundles and/or configuration files, though, so they're included in the above table for reference purposes.
{% endhint %}

