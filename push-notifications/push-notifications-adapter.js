
function getAdapterForEnvironment() {
    console.log(process.env.NODE_ENV == "production")
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV == "production") {
        return {
            ios: [
                {
                    pfx: './push-notifications/resources/lab262.boomerang.production.p12', // Dev PFX or P12
                    bundleId: 'lab262.boomerang.production',
                    passphrase: 'lab262boomerang$$$', // optional password to your p12
                    production: true // Dev
                }
            ]
        }
    } else if (process.env.NODE_ENV == "test") {
        return {
            ios: [
                {
                    pfx: './push-notifications/resources/lab262.boomerang.test.p12', // Dev PFX or P12
                    bundleId: 'lab262.boomerang.test',
                    passphrase: 'lab262boomerang$$$', // optional password to your p12
                    production: true // Production
                },
                {
                    pfx: './push-notifications/resources/lab262.boomerang.test-dev.p12', // Dev PFX or P12
                    bundleId: 'lab262.boomerang.test',
                    passphrase: 'lab262boomerang$$$', // optional password to your p12
                    production: false // Production
                },
            ]
        }
    } else {
        return {
            ios: [
                {
                    pfx: './push-notifications/resources/lab262.boomerang.dev.p12', // Dev PFX or P12
                    bundleId: 'lab262.boomerang.dev',
                    passphrase: 'lab262boomerang$$$', // optional password to your p12
                    production: false // Dev
                }
            ]
        }
    }
}
console.log(getAdapterForEnvironment())
module.exports = getAdapterForEnvironment()