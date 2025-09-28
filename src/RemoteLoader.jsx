import React, { useEffect, useState } from "react";

// load a remoteEntry.js once
const containerCache = new Map();

async function loadRemoteEntry(url, scope) {
    await __webpack_init_sharing__("default");
    const u = new URL(url);
    u.searchParams.set("v", Date.now().toString());

    await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = u.toString();
        s.type = "text/javascript";
        s.async = true;
        s.onload = () => {
            const ok = window[scope]?.init;
            if (!ok) return reject(new Error(`Remote "${scope}" not found at ${u}`));
            resolve(null);
        };
        s.onerror = () => reject(new Error(`Failed to load ${u} (network or 404)`));
        document.head.appendChild(s);
    });

    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);
    return container;
}

async function loadModule(scope, module) {
    const container = await loadRemoteEntry(window.__remoteUrls[scope], scope);
    const getFn = await container.get(module);
    if (!getFn)
        throw new Error(`Module "${module}" not found in scope "${scope}"`);
    return getFn();
}

// Fetch remotes.json once and stash the mapping
async function ensureRemoteConfig() {
    if (window.__remoteUrls) return;
    const res = await fetch("/remotes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load remotes.json");
    window.__remoteUrls = await res.json();
}


export default function RemoteLoader({
    scope,
    module,
    fallback = null,
    render,
}) {
    const [Comp, setComp] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await ensureRemoteConfig();
                const mod = await loadModule(scope, module);
                if (mounted) setComp(() => mod.default || mod);
            } catch (e) {
                if (mounted) setErr(e);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [scope, module]);

    if (err) return render?.({ error: err }) ?? fallback;
    if (!Comp) return fallback;
    return render ? render({ Component: Comp }) : <Comp />;
}
