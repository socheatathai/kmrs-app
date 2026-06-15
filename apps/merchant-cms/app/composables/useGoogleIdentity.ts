type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfig = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
};

type GoogleAccounts = {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccounts;
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (window.google?.accounts) {
    return Promise.resolve();
  }

  googleScriptPromise ??= new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Google sign-in")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load Google sign-in")),
      {
        once: true,
      },
    );
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const useGoogleIdentity = () => {
  const config = useRuntimeConfig();
  const clientId = computed(() => config.public.googleClientId || "");
  const isConfigured = computed(() => Boolean(clientId.value));

  const renderButton = async (
    element: HTMLElement,
    callback: (idToken: string) => void,
    options: GoogleButtonConfig = {},
  ) => {
    if (!import.meta.client || !isConfigured.value) {
      return;
    }

    await loadGoogleScript();

    window.google?.accounts?.id.initialize({
      client_id: clientId.value,
      callback: (response) => {
        if (response.credential) {
          callback(response.credential);
        }
      },
    });

    window.google?.accounts?.id.renderButton(element, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: element.clientWidth || 380,
      ...options,
    });
  };

  return {
    isConfigured,
    renderButton,
  };
};
