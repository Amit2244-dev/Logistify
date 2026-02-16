export const EMAIL_STATUS = [
    { value: "", viewValue: "All", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    // { value: "read", viewValue: "Read", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    { value: "active", viewValue: "Active", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    // { value: "draft", viewValue: "Draft", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    { value: "sent", viewValue: "Sent", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    { value: "archive", viewValue: "Archive", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' }
];

export const FILTER_LIST = [
    'Email', 'Tags'
];

export const EMAIL_PROVIDERS = [
    { value: "outlook", viewValue: "Outlook", provider: "outlook", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
    { value: "google", viewValue: "Google", provider: "google", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
]

export const QUILL_MODULES = {
    toolbar: {
        container: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'ltr' }],
            [{ 'align': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['attach'],
            ['clean']
        ],
    }
};



export const ORGANIZATION = {
    name: 'Logistify',
    _id: '68ac2f60427985cab69effbf'
};