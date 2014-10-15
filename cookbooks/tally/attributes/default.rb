node.default[:java][:install_flavor] = 'openjdk'
node.default[:java][:jdk_version] = '7'

#--[ HACKY HACKY HACKY  ]--#
# Super ugly hack to fix a bug in the ES cookbook that doesn't take the updated
# version into account when building the download url.
node.normal[:elasticsearch][:version] = '1.2.4'
node.normal[:elasticsearch][:filename] = "elasticsearch-#{node.elasticsearch[:version]}.tar.gz"
node.normal[:elasticsearch][:download_url] = [node.elasticsearch[:host], node.elasticsearch[:repository], node.elasticsearch[:filename]].join('/')
#--[ END UBER HACKINESS ]--#

node.normal[:elasticsearch][:plugins] = {
  'mobz/elasticsearch-head' => {},
  'elasticsearch/elasticsearch-analysis-kuromoji' => { 'version' => '2.2.0' },
  'elasticsearch/elasticsearch-analysis-icu' => { 'version' => '2.1.0' }
}
node.normal[:elasticsearch][:cluster][:name] = 'tally_es'
node.normal[:openssh][:server][:x11_forwarding] = 'yes'

