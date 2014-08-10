require 'nokogiri'
require 'open-uri'
require 'sinatra'
require 'json'
require 'pry'
require_relative 'helpers/scrapeHelper'

get '/' do
  File.read(File.join('public/app', 'index.html'))
end

post '/search' do
  content_type :json
  ng_params = env['rack.input'].gets #request.body.read
  begin
    player_games_stat = scrapping_player_stat(ng_params)
    status 200
    body(player_games_stat.to_json)
  rescue
    status 400
    body("There is some unknown error.")
  end
end


