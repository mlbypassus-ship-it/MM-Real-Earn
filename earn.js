/* MM REAL EARN - EARN SYSTEM */

const SUPABASE_URL =
"https://acclbthzfzrfbwyslpvv.supabase.co";

const SUPABASE_KEY =
"sb_publishable_PxrCIfh0MfL6KT1iQxgqfw__IgNG1OY";

const { createClient } =
supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* =========================
   CURRENT USER
========================= */

async function getCurrentUser(){

    const { data, error } =
        await createClient.auth.getUser();

    if(error || !data.user){
        return null;
    }

    return data.user;
}


/* =========================
   GET BALANCE
========================= */

async function getBalance(){

    const user = await getCurrentUser();

    if(!user) return 0;

    const { data, error } =
        await createClient
        .from("profiles")
        .select("balance")
        .eq("email", user.email)
        .single();

    if(error){
        console.log("Balance error:", error);
        return 0;
    }

    return Number(data.balance) || 0;
}


/* =========================
   ADD BALANCE
========================= */

async function addBalance(amount){

    amount = Number(amount);

    if(!amount || amount <= 0){
        return false;
    }

    const user = await getCurrentUser();

    if(!user){
        alert("Please login first.");
        return false;
    }

    const current =
        await getBalance();

    const newBalance =
        current + amount;

    const { error } =
        await createClient
        .from("profiles")
        .update({
            balance: newBalance
        })
        .eq("email", user.email);

    if(error){

        console.log(error);

        alert(
            "Reward could not be added."
        );

        return false;
    }

    localStorage.setItem(
        "mmBalance",
        newBalance
    );

    window.dispatchEvent(
        new Event("balanceUpdated")
    );

    return true;
}


/* =========================
   RANDOM 10 - 50 MMK
========================= */

function randomReward(){

    return Math.floor(
        Math.random() * 41
    ) + 10;

}


/* =========================
   GAME REWARD
========================= */

async function giveGameReward(){

    const reward =
        randomReward();

    const success =
        await addBalance(reward);

    if(success){

        alert(
            "🎉 Game Reward\n\n+" +
            reward +
            " MMK"
        );

        return reward;
    }

    return 0;
}


/* =========================
   VIDEO DAILY LIMIT
   MAX 2000 MMK
========================= */

function getVideoToday(){

    const today =
        new Date()
        .toISOString()
        .slice(0,10);

    const saved =
        JSON.parse(
            localStorage.getItem(
                "videoReward"
            ) || "{}"
        );

    if(saved.date !== today){

        return {
            date: today,
            amount: 0
        };

    }

    return saved;
}


function getVideoRemaining(){

    const data =
        getVideoToday();

    return Math.max(
        0,
        2000 - Number(data.amount || 0)
    );
}


/* =========================
   VIDEO REWARD
========================= */

async function giveVideoReward(){

    const remaining =
        getVideoRemaining();

    if(remaining <= 0){

        alert(
            "Today's video reward limit of 2000 MMK has been reached."
        );

        return 0;
    }

    let reward =
        randomReward();

    if(reward > remaining){
        reward = remaining;
    }

    const success =
        await addBalance(reward);

    if(!success){
        return 0;
    }

    const today =
        new Date()
        .toISOString()
        .slice(0,10);

    const old =
        getVideoToday();

    old.date = today;

    old.amount =
        Number(old.amount || 0) +
        reward;

    localStorage.setItem(
        "videoReward",
        JSON.stringify(old)
    );

    alert(
        "🎬 Video Reward\n\n+" +
        reward +
        " MMK"
    );

    return reward;
}


/* =========================
   ADS REWARD
   100 MMK
========================= */

async function giveAdReward(){

    const success =
        await addBalance(100);

    if(success){

        alert(
            "📺 Ad Reward\n\n+100 MMK"
        );

        return 100;
    }

    return 0;
}


/* =========================
   SHOW MAIN BALANCE
========================= */

async function showBalance(elementId){

    const element =
        document.getElementById(
            elementId
        );

    if(!element) return;

    const balance =
        await getBalance();

    element.innerText =
        balance.toLocaleString();

    localStorage.setItem(
        "mmBalance",
        balance
    );
}


/* =========================
   AUTO UPDATE
========================= */

window.addEventListener(
    "balanceUpdated",
    function(){

        showBalance(
            "mainBalance"
        );

        showBalance(
            "withdrawBalance"
        );

    }
);
