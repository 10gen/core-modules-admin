var tree = [
    {pretty: 'Blog', target: false},
    {pretty: 'Posts', target: 'posts'},
    {pretty: 'Drafts', target: 'drafts'},
    {pretty: 'Pages', target: 'pages'},
    {pretty: 'Categories', target: 'categories'},
    {pretty: '404s', target: 'missing'},
    {pretty: 'Comments', target: 'comments'}
];

var reverse = {
    'post_edit': 'posts',
    'category_edit': 'categories',
};
return {tree: tree, reverse: reverse};
