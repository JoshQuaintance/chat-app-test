<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { db } from '../firebase';
    import dayjs from 'dayjs';
    import { getDocs, collection, onSnapshot, addDoc, Timestamp, orderBy, query } from 'firebase/firestore';

    let name = 'Anonymous';
    let message: string;
    let messages = [];

    let scrollTo;
    let barHeight;

    interface Message {
        name: string;
        message: string;
        createdAt: number;
    }

    onMount(async () => {
        let docs = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'asc')));

        docs.forEach((doc) => {
            messages = [...messages, doc.data()];
        });

        const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && snapshot.size != messages.length) {
                    messages = [...messages, change.doc.data() as Message];

                    setTimeout(() => {
                        document.getElementById('scroll-to').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        });

        setTimeout(() => {
            document.getElementById('scroll-to').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });


    let timer = 0;

    async function sendText() {
        let savedName = name || 'Anonymous';

        if (message == '') return;

        async function sendRequest() {
            await addDoc(collection(db, 'messages'), {
                name: savedName,
                message,
                createdAt: Timestamp.now()
            });

            timer = 10;
        }

        setInterval(() => {
            if (timer > 0) timer--
        }, 1000)


        message = '';
    }

    $: watchMessages = messages;
</script>

<div id="massive-container" class="flex flex-col justify-between">
    <div id="chatbox" class="p-5 h-[77.5vh] overflow-y-auto overflow-x-hidden">
        {#each watchMessages as m}
            <div class="message-container w-full mb-6">
                <span class="separator relative min-w-full" />

                <style lang="postcss">
                    .separator::before {
                        @apply border-slate-500 bg-slate-500 border-[1px];
                        @apply rounded-lg;
                        @apply absolute h-0 p-0 top-[-.2rem];

                        content: '';
                        width: calc(100vw - 1.25rem * 2);
                    }
                </style>

                <span class="flex flex-row justify-start items-baseline mb-1">
                    <h1 class="mr-4 font-bold text-xl">{m.name}</h1>
                    <p class="text-slate-600 text-xs">{dayjs(m.createdAt.toDate()).format('MMMM D, YYYY hh:mm A')}</p>
                </span>

                <span>
                    <p>{m.message}</p>
                </span>
            </div>
        {/each}
        <span id="scroll-to" bind:this={scrollTo} />
    </div>

    <div
        id="text-bar"
        class="bg-slate-400 p-4 flex flex-col justify-between items-center w-screen"
        bind:clientHeight={barHeight}>
        <div id="nickname-bar" class="w-full px-1 text-slate-100">
            Nickname: <strong>{name}</strong>

            <br />
            <input type="text" placeholder="Change nickname" bind:value={name} class="mt-1 p-1 rounded-md text-black" />

            <!-- <button class="bg-blue-900 text-white rounded-md p-1 ml-2" on:click={changeNickname}>Change Nickname</button> -->
        </div>

        <div id="input-container" class="flex flex-row justify-between items-center w-full">
            <textarea
                type="text"
                placeholder="Type your text here!"
                wrap="hard"
                cols="1"
                bind:value={message}
                class="w-full rounded-md p-2 m-1"
                style="resize: none;" />

            <button class="bg-blue-900 text-white rounded-md p-2 m-2" on:click={sendText}> Send </button>
        </div>
    </div>
</div>
