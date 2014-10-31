include_recipe 'apt'
include_recipe 'build-essential'
include_recipe 'git'
include_recipe 'openssh'
include_recipe 'nodejs'
include_recipe 'java'
include_recipe 'elasticsearch'
include_recipe 'elasticsearch::plugins'
include_recipe 'mongodb'

apt_package 'exuberant-ctags'
apt_package 'vim-nox'
apt_package 'tmux'
apt_package 'xclip'
