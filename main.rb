require 'nokogiri'
require 'open-uri'
require 'sinatra'

set :sessions, true

get '/' do
  erb :main
end


