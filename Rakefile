require 'mongoid'
require File.join(File.dirname(__FILE__),'server.rb')

Mongoid.load!("config/mongoid.yml")

namespace :db do
  task :scrape_player_list do 
    scrape_player_namelist
    puts 'Scraping data done'
  end
  task :scrape_draft_data do
    unless ARGV.length == 3
      puts 'There should be exactly two argument of first_year and last_year'
      exit
    end
    (ARGV[1]..ARGV[2]).each do |year|
      puts "Scraping data of #{year}"
      scrape_player_draft_pick(year)
    end
    puts 'Scraping data done'
    #prevent rake from attempting to invoke a task for each command line argument.
    task ARGV[2] do ; end
    task ARGV[3] do ; end
  end
end