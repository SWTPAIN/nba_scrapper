require 'nokogiri'
require 'open-uri'
require 'sinatra'
require 'json'
require 'mongoid'
require 'pry'
require_relative 'helpers/scrapeHelper'

Mongoid.load!("config/mongoid.yml")

class Player
  include Mongoid::Document

  field :full_name, type: String
  field :position, type: Array, default: []
  field :height, type: Integer
  field :weight, type: Integer
  embeds_many :year_game_stat

  accepts_nested_attributes_for :year_game_stat
end


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
    puts "Sent a json response back"
  rescue =>error
    status 400
    puts error.backtrace
    body(error.message)
  end
end


