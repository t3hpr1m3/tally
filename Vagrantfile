# -*- mode: ruby -*-
# vi: set ft=ruby :

def hostname(node)
  "#{node.to_s}.firma8.local"
end

IP_ADDRESS_PREFIX = '10.11.12.'

Vagrant.configure('2') do |config|
  config.vm.box = 'precise64'
  config.vm.box_url = 'http://files.vagrantup.com/precise64.box'
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.ssh.forward_agent = true
  config.ssh.forward_x11 = true

  config.vm.provider :virtualbox do |vb|
    vb.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    vb.customize ['modifyvm', :id, '--natdnsproxy1', 'on']
    vb.cpus = 4
    vb.memory = 1536
  end

  config.vm.boot_timeout = 120

  config.omnibus.chef_version = :latest

  if Vagrant.has_plugin?('vagrant-cachier')
    config.cache.scope = :box
    config.cache.synced_folder_opts = {
      type: :nfs,
      mount_options: ['rw', 'vers=3', 'tcp', 'nolock']
    }
  end

  if Vagrant.has_plugin?('berkshelf')
    config.berkshelf.enabled = true
  end

  config.vm.hostname = hostname('tally') 
  config.vm.synced_folder '.', '/vagrant', type: 'nfs'
  config.vm.network :private_network, ip: IP_ADDRESS_PREFIX + '30'
  config.vm.network 'forwarded_port', guest: 3003, host: 3003

  config.vm.provision :chef_solo do |chef|
    chef.custom_config_path = 'Vagrantfile.chef'
    chef.add_recipe 'tally'
  end
end

