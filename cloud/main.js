Parse.Cloud.define('testehuallyd', function (req, res) {

    
    if (testehuallydfuncao("oi")) {
    res.success({msg:"foi"})

    } else {
    res.error({error:"error oi nao tcahu"})

    }
});

function testehuallydfuncao(variavelGAMBIRA) {
    if(variavelGAMBIRA == "oi") {
        return true
    } else {
        return false
    }
}